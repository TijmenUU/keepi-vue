using EntityFramework.Exceptions.Common;
using Keepi.Core;
using Keepi.Core.Entities;
using Keepi.Core.Enums;
using Keepi.Core.Repositories;
using Keepi.Infrastructure.Data.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Keepi.Infrastructure.Data.Repositories;

internal sealed class UserRepository(DatabaseContext databaseContext, ILogger<UserRepository> logger)
 : IGetUserEntryCategories,
  IGetUserExists,
  IGetUser,
  IStoreNewUser
{
  async Task<bool> IGetUserExists.Execute(string externalId, string emailAddress, CancellationToken cancellationToken)
  {
    return await databaseContext.Users.AnyAsync(
      u => u.ExternalId == externalId || u.EmailAddress == emailAddress,
      cancellationToken);
  }

  async Task<EntryCategoryEntity[]> IGetUserEntryCategories.Execute(int userId, CancellationToken cancellationToken)
  {
    var entryCategories = await databaseContext.EntryCategories
      .Where(c => c.UserId == userId)
      .ToArrayAsync(cancellationToken);

    return entryCategories
      .Select(c => new EntryCategoryEntity(
        id: c.Id,
        name: c.Name,
        enabled: c.Enabled,
        activeFrom: c.ActiveFrom,
        activeTo: c.ActiveTo))
      .ToArray();
  }

  async Task<IMaybeErrorResult<StoreNewUserError>> IStoreNewUser.Execute(
    string externalId,
    string emailAddress,
    string name,
    UserIdentityProvider userIdentityProvider,
    CancellationToken cancellationToken)
  {
    try
    {
      databaseContext.Add(new Entities.UserEntity
      {
        ExternalId = externalId,
        EmailAddress = emailAddress,
        Name = name,
        IdentityOrigin = ToDatabaseEnum(userIdentityProvider),
      });
      await databaseContext.SaveChangesAsync(cancellationToken);

      return MaybeErrorResult<StoreNewUserError>.CreateSuccess();
    }
    // This is a bit of a rough catch as it is not known what caused the
    // exception. Sqlite does not provide the exact constraint nor column name
    // so for now this seems all that can be done.
    catch (UniqueConstraintException)
    {
      return MaybeErrorResult<StoreNewUserError>.CreateFailure(StoreNewUserError.DuplicateUser);
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Unexpected error whilst storing new user");
      return MaybeErrorResult<StoreNewUserError>.CreateFailure(StoreNewUserError.Unknown);
    }
  }

  async Task<IValueOrErrorResult<UserEntity, GetUserError>> IGetUser.Execute(
    string externalId,
    UserIdentityProvider identityProvider,
    CancellationToken cancellationToken)
  {
    var identityOrigin = ToDatabaseEnum(identityProvider);
    try
    {
      var user = await databaseContext.Users.FirstOrDefaultAsync(
      predicate: u => u.ExternalId == externalId && u.IdentityOrigin == identityOrigin,
      cancellationToken: cancellationToken);

      if (user == null)
      {
        return ValueOrErrorResult<UserEntity, GetUserError>.CreateFailure(GetUserError.DoesNotExist);
      }

      return ValueOrErrorResult<UserEntity, GetUserError>.CreateSuccess(new UserEntity(
        id: user.Id,
        emailAddress: user.EmailAddress,
        name: user.Name,
        identityOrigin: user.IdentityOrigin.MapToDomainModel()));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Unexpected error whilst trying to get user");
      return ValueOrErrorResult<UserEntity, GetUserError>.CreateFailure(GetUserError.Unknown);
    }
  }

  private static Enums.UserIdentityOrigin ToDatabaseEnum(UserIdentityProvider userIdentityProvider)
  {
    return userIdentityProvider switch
    {
      UserIdentityProvider.GitHub => Enums.UserIdentityOrigin.GitHub,
      _ => throw new ArgumentOutOfRangeException(paramName: nameof(userIdentityProvider))
    };
  }
}