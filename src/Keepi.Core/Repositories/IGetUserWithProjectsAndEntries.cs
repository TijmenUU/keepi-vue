using Keepi.Core.Aggregates;

namespace Keepi.Core.Repositories;

public interface IGetUserWithProjectsAndEntries
{
  Task<UserAggregate> Execute(int userId, CancellationToken cancellationToken);
}