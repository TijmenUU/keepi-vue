using System.Security.Claims;
using Keepi.Core.Entities;
using Keepi.Core.Enums;
using Keepi.Core.Repositories;

namespace Keepi.Api.Helpers;

public interface IResolveUserHelper
{
  Task<UserEntity?> GetUserOrNull(ClaimsPrincipal userClaimsPrincipal, CancellationToken cancellationToken);
}

internal class ResolveUserHelper(IGetUser getUser) : IResolveUserHelper
{
  private readonly SemaphoreSlim getUserSemaphore = new(initialCount: 1, maxCount: 1);

  private bool hasCachedUser = false;
  private UserEntity? cachedUser = null;

  public async Task<UserEntity?> GetUserOrNull(
    ClaimsPrincipal userClaimsPrincipal,
    CancellationToken cancellationToken)
  {
    if (!hasCachedUser)
    {
      await getUserSemaphore.WaitAsync(cancellationToken: cancellationToken);
      try
      {
        if (!hasCachedUser)
        {
          cachedUser = await InternalGetUserOrNull(
            userClaimsPrincipal: userClaimsPrincipal,
            cancellationToken: cancellationToken);
          hasCachedUser = true;
        }
      }
      finally
      {
        getUserSemaphore.Release();
      }
    }

    return cachedUser;
  }

  private async Task<UserEntity?> InternalGetUserOrNull(
    ClaimsPrincipal userClaimsPrincipal,
    CancellationToken cancellationToken)
  {
    if (!userClaimsPrincipal.TryGetUserInfo(out var userInfo))
    {
      return null;
    }

    var result = await getUser.Execute(
      externalId: userInfo.ExternalId,
      identityProvider: UserIdentityProvider.GitHub,
      cancellationToken: cancellationToken);

    if (result.TrySuccess(out var success, out _))
    {
      return success;
    }

    return null;
  }
}