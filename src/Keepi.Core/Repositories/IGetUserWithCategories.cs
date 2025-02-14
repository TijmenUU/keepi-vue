using Keepi.Core.Aggregates;

namespace Keepi.Core.Repositories;

public interface IGetUserWithCategories
{
  Task<UserAggregate> Execute(int userId, CancellationToken cancellationToken);
}