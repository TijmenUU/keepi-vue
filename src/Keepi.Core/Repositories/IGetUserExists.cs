namespace Keepi.Core.Repositories;

public interface IGetUserExists
{
  Task<bool> UserExists(string externalId, string emailAddress, CancellationToken cancellationToken);
}