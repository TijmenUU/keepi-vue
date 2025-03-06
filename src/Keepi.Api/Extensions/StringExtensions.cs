namespace Keepi.Api.Extensions;

internal static class StringExtensions
{
  public static DateOnly? GetIsoDateOrNull(this string? value)
  {
    if (value == null || !DateOnly.TryParseExact(s: value, format: "yyyy-MM-dd", out var parsed))
    {
      return null;
    }

    return parsed;
  }
}