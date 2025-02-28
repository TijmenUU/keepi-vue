using Keepi.Core.Entities;

namespace Keepi.Core.Repositories;

public interface IGetUserEntryCategories
{
  Task<EntryCategoryEntity[]> Execute(int userId, CancellationToken cancellationToken);
}