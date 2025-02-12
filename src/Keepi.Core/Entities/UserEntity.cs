namespace Keepi.Core.Entities;

public sealed class UserEntity
{
  public UserEntity(
    int id,
    string emailAddress,
    string name,
    UserIdentityOrigin identityOrigin)
  {
    Id = id;
    EmailAddress = emailAddress;
    Name = name;
    IdentityOrigin = identityOrigin;
  }

  public int Id { get; }
  public string EmailAddress { get; }
  public string Name { get; }
  public UserIdentityOrigin IdentityOrigin { get; }
}

public enum UserIdentityOrigin
{
  GitHub,
}