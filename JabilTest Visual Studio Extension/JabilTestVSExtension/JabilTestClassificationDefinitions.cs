using System.ComponentModel.Composition;
using Microsoft.VisualStudio.Language.StandardClassification;
using Microsoft.VisualStudio.Text.Classification;
using Microsoft.VisualStudio.Utilities;

namespace JabilTestVSExtension;

internal static class JabilTestClassificationDefinitions
{
    public const string KeywordClassificationName = "JabilTestKeyword";
    public const string CommentClassificationName = "JabilTestComment";
    public const string StringClassificationName = "JabilTestString";
    public const string NumberClassificationName = "JabilTestNumber";
    public const string FunctionClassificationName = "JabilTestFunction";
    public const string BuiltInFunctionClassificationName = "JabilTestBuiltInFunction";

    [Export(typeof(ClassificationTypeDefinition))]
    [Name(KeywordClassificationName)]
    [BaseDefinition(PredefinedClassificationTypeNames.Keyword)]
    internal static ClassificationTypeDefinition? KeywordType;

    [Export(typeof(ClassificationTypeDefinition))]
    [Name(CommentClassificationName)]
    [BaseDefinition(PredefinedClassificationTypeNames.Comment)]
    internal static ClassificationTypeDefinition? CommentType;

    [Export(typeof(ClassificationTypeDefinition))]
    [Name(StringClassificationName)]
    [BaseDefinition(PredefinedClassificationTypeNames.String)]
    internal static ClassificationTypeDefinition? StringType;
    [Export(typeof(ClassificationTypeDefinition))]
    [Name(NumberClassificationName)]
    [BaseDefinition(PredefinedClassificationTypeNames.Number)]
    internal static ClassificationTypeDefinition? NumberType;

    [Export(typeof(ClassificationTypeDefinition))]
    [Name(FunctionClassificationName)]
    [BaseDefinition(PredefinedClassificationTypeNames.Identifier)]
    internal static ClassificationTypeDefinition? FunctionType;

    [Export(typeof(ClassificationTypeDefinition))]
    [Name(BuiltInFunctionClassificationName)]
    [BaseDefinition(PredefinedClassificationTypeNames.Keyword)]
    internal static ClassificationTypeDefinition? BuiltInFunctionType;
}
