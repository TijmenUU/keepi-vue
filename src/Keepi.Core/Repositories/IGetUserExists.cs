namespace Keepi.Core.Repositories;

public interface IGetUserExists
{
  Task<bool> Execute(string externalId, string emailAddress, CancellationToken cancellationToken);
}