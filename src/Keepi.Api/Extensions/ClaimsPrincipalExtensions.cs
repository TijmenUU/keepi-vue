using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;
using Keepi.Core.Entities;

namespace Keepi.Api.Extensions;

internal static class ClaimsPrincipalExtensions
{
  public static bool TryGetUserInfo(
    this ClaimsPrincipal User,
    [NotNullWhen(returnValue: true)] out UserInfo? userInfo)
  {
    var externalIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    string? userName = User.Identity?.Name;
    string? emailAddress = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

    if (string.IsNullOrWhiteSpace(externalIdClaim?.Value) ||
      User.Identity?.AuthenticationType != "GitHub" ||
      string.IsNullOrWhiteSpace(userName) ||
      string.IsNullOrWhiteSpace(emailAddress))
    {
      userInfo = null;
      return false;
    }

    userInfo = new UserInfo(
      externalId: externalIdClaim.Value,
      name: userName,
      emailAddress: emailAddress,
      origin: UserIdentityOrigin.GitHub);
    return true;
  }
}

internal class UserInfo(string externalId, string name, string emailAddress, UserIdentityOrigin origin)
{
  public readonly string ExternalId = externalId;
  public readonly string Name = name;
  public readonly string EmailAddress = emailAddress;
  public readonly UserIdentityOrigin Origin = origin;
}