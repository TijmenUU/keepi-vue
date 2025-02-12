using Keepi.Core.Entities;

namespace Keepi.Core.Aggregates;

public sealed class UserAggregate : IAggregateRoot
{
  public UserAggregate(
    UserEntity user,
    List<EntryCategoryEntity> categories,
    List<UserEntryEntity> entries)
  {
    EmailAddress = user.EmailAddress;
    Name = user.Name;
    IdentityOrigin = user.IdentityOrigin;

    Categories = categories;
    Entries = entries;
  }

  public string EmailAddress { get; }
  public string Name { get; }
  public UserIdentityOrigin IdentityOrigin { get; }

  public List<EntryCategoryEntity> Categories { get; }
  public List<UserEntryEntity> Entries { get; }
}