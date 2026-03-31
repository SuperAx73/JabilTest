using System.ComponentModel.Composition;
using Microsoft.VisualStudio.Utilities;

namespace JabilTestVSExtension;

internal static class JabilTestContentTypeDefinition
{
    [Export]
    [Name("jabiltest")]
    [BaseDefinition("code")]
    internal static ContentTypeDefinition? JabilTestContentType;

    [Export]
    [FileExtension(".jts")]
    [ContentType("jabiltest")]
    internal static FileExtensionToContentTypeDefinition? JabilTestFileExtension;

    [Export]
    [FileExtension(".t")]
    [ContentType("jabiltest")]
    internal static FileExtensionToContentTypeDefinition? TFileExtension;

    [Export]
    [FileExtension(".inc")]
    [ContentType("jabiltest")]
    internal static FileExtensionToContentTypeDefinition? IncFileExtension;

    [Export]
    [FileExtension(".pln")]
    [ContentType("jabiltest")]
    internal static FileExtensionToContentTypeDefinition? PlnFileExtension;

    [Export]
    [FileExtension(".silk")]
    [ContentType("jabiltest")]
    internal static FileExtensionToContentTypeDefinition? SilkFileExtension;
}
