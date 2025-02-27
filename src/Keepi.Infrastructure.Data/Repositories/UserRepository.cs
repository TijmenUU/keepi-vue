using Keepi.Core.Aggregates;
using Keepi.Core.Entities;
using Keepi.Core.Repositories;
using Keepi.Core.UseCases;
using Keepi.Infrastructure.Data.Enums;
using Microsoft.EntityFrameworkCore;

namespace Keepi.Infrastructure.Data.Repositories;

internal sealed class UserRepository(DatabaseContext databaseContext)
 : IGetUserWithCategories,
  IGetUserExists,
  IStoreNewUser
{
  async Task<bool> IGetUserExists.Execute(string externalId, string emailAddress, CancellationToken cancellationToken)
  {
    return await databaseContext.Users.AnyAsync(
      u => u.ExternalId == externalId || u.EmailAddress == emailAddress,
      cancellationToken);
  }

  async Task<UserAggregate> IGetUserWithCategories.Execute(int userId, CancellationToken cancellationToken)
  {
    var user = await databaseContext.Users
      .Include(u => u.Entries)
      .Include(u => u.EntryCategories)
      .SingleAsync(u => u.Id == userId, cancellationToken);

    return new UserAggregate(
      user: new UserEntity(
        id: user.Id,
        emailAddress: user.EmailAddress,
        name: user.Name,
        identityOrigin: user.IdentityOrigin.MapToDomainModel()),
      categories: user.EntryCategories
        .Select(c => new EntryCategoryEntity(
          id: c.Id,
          name: c.Name,
          enabled: c.Enabled,
          activeFrom: c.ActiveFrom,
          activeTo: c.ActiveTo))
        .ToList(),
      entries: user.Entries
        .Select(e => new UserEntryEntity(
          id: e.Id,
          userId: e.Id,
          entryCategoryId: e.EntryCategoryId,
          date: e.Date,
          minutes: e.Minutes,
          remark: e.Remark))
        .ToList());
  }

  async Task IStoreNewUser.Execute(
    string externalId,
    string emailAddress,
    string name,
    RegisterUserIdentityProvider userIdentityProvider,
    CancellationToken cancellationToken)
  {
    if (userIdentityProvider != RegisterUserIdentityProvider.GitHub)
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