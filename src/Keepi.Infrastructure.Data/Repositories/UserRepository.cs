using Keepi.Core.Entities;
using Keepi.Core.Enums;
using Keepi.Core.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Keepi.Infrastructure.Data.Repositories;

internal sealed class UserRepository(DatabaseContext databaseContext)
 : IGetUserEntryCategories,
  IGetUserExists,
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

  async Task IStoreNewUser.Execute(
    string externalId,
    string emailAddress,
    string name,
    UserIdentityProvider userIdentityProvider,
    CancellationToken cancellationToken)
  {
    if (userIdentityProvider != UserIdentityProvider.GitHub)
    {
      throw new ArgumentOutOfRangeException(paramName: nameof(userIdentityProvider));
    }

    databaseContext.Add(new Entities.UserEntity
    {
      ExternalId = externalId,
      EmailAddress = emailAddress,
      Name = name,
      IdentityOrigin = Enums.UserIdentityOrigin.GitHub,
    });
    await databaseContext.SaveChangesAsync(cancellationToken);
  }
}