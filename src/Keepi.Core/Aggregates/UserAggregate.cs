using Keepi.Core.Entities;

namespace Keepi.Core.Aggregates;

public sealed class UserAggregate : IAggregateRoot
{
  public UserAggregate(
    UserEntity user,
    IReadOnlyList<EntryCategoryEntity> categories)
  {
    EmailAddress = user.EmailAddress;
    Name = user.Name;
    IdentityOrigin = user.IdentityOrigin;

    Categories = categories;
  }

  public string EmailAddress { get; }
  public string Name { get; }
  public UserIdentityOrigin IdentityOrigin { get; }

  public IReadOnlyList<EntryCategoryEntity> Categories { get; }
}