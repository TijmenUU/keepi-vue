using Keepi.Core.Entities;

namespace Keepi.Core.Repositories;

public enum StoreEntryCategoryError
{
  Unknown,
  DuplicateName,
}

public interface IStoreEntryCategory
{
  Task<IValueOrErrorResult<EntryCategoryEntity, StoreEntryCategoryError>> Execute(
    int userId,
    string name,
    bool enabled,
    DateOnly? activeFrom,
    DateOnly? activeTo,
    CancellationToken cancellationToken);
}