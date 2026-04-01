using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.VisualStudio.Text;
using Microsoft.VisualStudio.Text.Classification;
using Microsoft.VisualStudio.Utilities;

namespace JabilTestVSExtension;

internal sealed class JabilTestClassifier : IClassifier
{
    private static readonly HashSet<string> Keywords = new(StringComparer.OrdinalIgnoreCase)
    {
        // Core keywords from SciTE jts.properties
        "call",
        "end",
        "function",
        "goto",
        "return",
        "setfinalizefunction",
        "setfailfunction",
        "setabortfunction",
        "settestname",
        "settestgroupname",
        "setproductname",
        "entercs",
        "exitcs",
        "label",
        "scriptif",
        "new",
        "true",
        "false",
        "while",
        "continue",
        "break",
        "if",
        // Additional common keywords
        "do",
        "try",
        "catch",
        "finally",
        "throw",
        "class",
        "struct",
        "enum",
        "void",
        "int",
        "float",
        "string",
        "boolean",
        "const",
        "null"
    };

    private static readonly Regex KeywordRegex = new(
        @"\b(call|end|function|goto|return|setfinalizefunction|setfailfunction|setabortfunction|settestname|settestgroupname|setproductname|entercs|exitcs|label|scriptif|new|true|false|while|continue|break|if|else|for|do|try|catch|finally|throw|class|struct|enum|void|int|float|string|boolean|const|null)\b",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private static readonly Regex CommentRegex = new(@"//.*$|/\*[\s\S]*?\*/", RegexOptions.Compiled | RegexOptions.Multiline);
    private static readonly Regex StringRegex = new("\"([^\"\\\\]|\\\\.)*\"", RegexOptions.Compiled);
    private static readonly Regex NumberRegex = new(@"\b\d+(?:\.\d+)?\b", RegexOptions.Compiled);
    private static readonly Regex BuiltInFunctionRegex = new(@"\b(AA_\w+|Abort\w*|Abs\w*|Add\w*|AES128CBC_\w+|AG\d+\w+|AgNA_\w+|API_\w+|ArcTangent|ARFSG_\w+|Array\w+|Audio_\w+|Authenticate\w+|Automation_\w+|Barrier\w+|Base64\w+|Binary\w+|BitWise\w+|BK8500_\w+|Builder\w+|ByteArray\w+|CalculateLinear\w+|CastVariable|Ceiling|ChartPanel_\w+|Clear\w+|Close\w+|CMD_\w+|Compress\w+|Configure\w+|Conversion_\w+|ConvertPolar\w+|ConvertRectangular\w+|CopyVariable|Cosine|CreateDirectory|CreateProcess|DAS_\w+|DataLake\w+|DataRow_\w+|DataTable_\w+|DateAdd\w+|DateParse\w+|Delete\w+|Desoutter_\w+|Dictionary_\w+|Directory\w+|Disable\w+|E36XX_\w+|Enable\w+|Enforce\w+|Enter\w+|Excel\w+|Extract\w+|Fail|File\w+|FTP\w+|GenerateFile\w+|Get\w+|HexLimit\w+|HexString\w+|Hide\w+|Hook\w+|Http\w+|HTTP_\w+|Hyperbolic\w+|IEEE\w+|iFactory_\w+|IniFile_\w+|Integer\w+|IsEqual|Ivi\w+|JemsAPI_\w+|JEMSms_\w+|JSON_\w+|JsonReport\w+|Keyboard_\w+|Ktdaq970a_\w+|Kill\w+|LeCroy\w+|Log\w+|Logical_\w+|MC_\w+|MES_\w+|MesReport\w+|Microsoft\w+|Mod|ModbusTCP_\w+|Multiply|N\d+XX_\w+|NaturalLog|New|NI_\w+|NIVISA_\w+|Numeric\w+|OPC\w+|OpenCV_\w+|Operator\w+|PCIE\w+|Ping\w+|Play\w+|PostgreSQL_\w+|Power|Process\w+|ReadAll\w+|Record\w+|Registry\w+|Reset\w+|Round|Safely\w+|Save\w+|SendEmail|Serial_\w+|Set\w+|SFTP_\w+|Show\w+|Simulate\w+|Sine|Sleep\w+|Split\w+|SQL_\w+|Sqrt|Ssh\w+|Start\w+|Stop\w+|String\w+|Subtract|Swap\w+|System\w+|Tangent|Tek\w+|Telnet\w+|Test|Twos\w+|Txt\w+|UDP\w+|Unhook\w+|Update\w+|USB_\w+|WaitEvent\w+|WaitOn\w+|Write\w+|Xml\w+)\b", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex FunctionRegex = new(@"\b([A-Za-z_][A-Za-z0-9_]*)\b(?=\s*\()", RegexOptions.Compiled);

    private readonly IClassificationType _keywordType;
    private readonly IClassificationType _commentType;
    private readonly IClassificationType _stringType;
    private readonly IClassificationType _numberType;
    private readonly IClassificationType _functionType;
    private readonly IClassificationType _builtInFunctionType;

    public JabilTestClassifier(IClassificationTypeRegistryService registry)
    {
        _keywordType = registry.GetClassificationType(JabilTestClassificationDefinitions.KeywordClassificationName);
        _commentType = registry.GetClassificationType(JabilTestClassificationDefinitions.CommentClassificationName);
        _stringType = registry.GetClassificationType(JabilTestClassificationDefinitions.StringClassificationName);
        _numberType = registry.GetClassificationType(JabilTestClassificationDefinitions.NumberClassificationName);
        _functionType = registry.GetClassificationType(JabilTestClassificationDefinitions.FunctionClassificationName);
        _builtInFunctionType = registry.GetClassificationType(JabilTestClassificationDefinitions.BuiltInFunctionClassificationName);
    }

#pragma warning disable 67
    public event EventHandler<ClassificationChangedEventArgs>? ClassificationChanged;
#pragma warning restore 67

    public IList<ClassificationSpan> GetClassificationSpans(SnapshotSpan span)
    {
        var results = new List<ClassificationSpan>();
        var text = span.GetText();
        var protectedSpans = new List<SnapshotSpan>();

        AddMatches(results, protectedSpans, span, text, CommentRegex, _commentType, _ => true);
        AddMatches(results, protectedSpans, span, text, StringRegex, _stringType, _ => true);
        AddMatches(results, protectedSpans, span, text, KeywordRegex, _keywordType, _ => true);
        AddMatches(results, protectedSpans, span, text, BuiltInFunctionRegex, _builtInFunctionType, _ => true);
        AddMatches(results, protectedSpans, span, text, NumberRegex, _numberType, _ => true);
        AddMatches(results, protectedSpans, span, text, FunctionRegex, _functionType, value => !Keywords.Contains(value));

        return results.OrderBy(x => x.Span.Start.Position).ToList();
    }

    private static void AddMatches(
        ICollection<ClassificationSpan> results,
        ICollection<SnapshotSpan> protectedSpans,
        SnapshotSpan fullSpan,
        string text,
        Regex regex,
        IClassificationType classificationType,
        Func<string, bool> allowMatch)
    {
        foreach (Match match in regex.Matches(text))
        {
            if (!match.Success || match.Length == 0 || !allowMatch(match.Value))
            {
                continue;
            }

            var start = fullSpan.Start + match.Index;
            var classifiedSpan = new SnapshotSpan(start, match.Length);

            if (OverlapsAny(classifiedSpan, protectedSpans))
            {
                continue;
            }

            results.Add(new ClassificationSpan(classifiedSpan, classificationType));
            protectedSpans.Add(classifiedSpan);
        }
    }

    private static bool OverlapsAny(SnapshotSpan span, IEnumerable<SnapshotSpan> existing)
    {
        foreach (var current in existing)
        {
            if (span.IntersectsWith(current))
            {
                return true;
            }
        }

        return false;
    }
}

[Export(typeof(IClassifierProvider))]
[ContentType("jabiltest")]
internal sealed class JabilTestClassifierProvider : IClassifierProvider
{
    [Import]
    private IClassificationTypeRegistryService? _classificationTypeRegistry;

    public IClassifier GetClassifier(ITextBuffer textBuffer)
    {
        return textBuffer.Properties.GetOrCreateSingletonProperty(() =>
            new JabilTestClassifier(_classificationTypeRegistry!));
    }
}
