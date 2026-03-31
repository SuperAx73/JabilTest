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
        "testcase",
        "appstate",
        "window",
        "dialog",
        "listbox",
        "button",
        "if",
        "else",
        "for",
        "while",
        "return",
        "call",
        "invoke",
        "print",
        "sleep",
        "integer",
        "string",
        "boolean",
        "void",
        "const",
        "true",
        "false",
        "null",
        "function",
        "end"
    };

    private static readonly Regex KeywordRegex = new(
        @"\b(testcase|appstate|window|dialog|listbox|button|if|else|for|while|return|call|invoke|print|sleep|integer|string|boolean|void|const|true|false|null|function|end)\b",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private static readonly Regex CommentRegex = new(@"//.*$|/\*[\s\S]*?\*/", RegexOptions.Compiled | RegexOptions.Multiline);
    private static readonly Regex StringRegex = new("\"([^\"\\\\]|\\\\.)*\"", RegexOptions.Compiled);
    private static readonly Regex NumberRegex = new(@"\b\d+(?:\.\d+)?\b", RegexOptions.Compiled);
    private static readonly Regex FunctionRegex = new(@"\b([A-Za-z_][A-Za-z0-9_]*)\b(?=\s*\()", RegexOptions.Compiled);

    private readonly IClassificationType _keywordType;
    private readonly IClassificationType _commentType;
    private readonly IClassificationType _stringType;
    private readonly IClassificationType _numberType;
    private readonly IClassificationType _functionType;

    public JabilTestClassifier(IClassificationTypeRegistryService registry)
    {
        _keywordType = registry.GetClassificationType(JabilTestClassificationDefinitions.KeywordClassificationName);
        _commentType = registry.GetClassificationType(JabilTestClassificationDefinitions.CommentClassificationName);
        _stringType = registry.GetClassificationType(JabilTestClassificationDefinitions.StringClassificationName);
        _numberType = registry.GetClassificationType(JabilTestClassificationDefinitions.NumberClassificationName);
        _functionType = registry.GetClassificationType(JabilTestClassificationDefinitions.FunctionClassificationName);
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
