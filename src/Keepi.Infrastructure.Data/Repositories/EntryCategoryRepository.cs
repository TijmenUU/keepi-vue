using EntityFramework.Exceptions.Common;
using Keepi.Core;
using Keepi.Core.Entities;
using Keepi.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace Keepi.Infrastructure.Data.Repositories;

internal class EntryCategoryRepository(DatabaseContext databaseContext, ILogger<EntryCategoryRepository> logger)
 : IStoreEntryCategory
{
  async Task<IValueOrErrorResult<EntryCategoryEntity, StoreEntryCategoryError>> IStoreEntryCategory.Execute(
    int userId,
    string name,
    bool enabled,
    DateOnly? activeFrom,
    DateOnly? activeTo,
    CancellationToken cancellationToken)
  {
    try
    {
      var entity = new Entities.EntryCategoryEntity
      {
        Name = name,
        Enabled = enabled,
        ActiveFrom = activeFrom,
        ActiveTo = activeTo,
        UserId = userId,
      };
      databaseContext.Add(entity);
      await databaseContext.SaveChangesAsync(cancellationToken: cancellationToken);

      return ValueOrErrorResult<EntryCategoryEntity, StoreEntryCategoryError>.CreateSuccess(new EntryCategoryEntity(
        id: entity.Id,
        name: entity.Name,
        enabled: entity.Enabled,
        activeFrom: entity.ActiveFrom,
        activeTo: entity.ActiveTo
      ));
    }
    // This is a bit of a rough catch as it is not known what caused the
    // exception. Sqlite does not provide the exact constraint nor column name
    // so for now this seems all that can be done.
    catch (UniqueConstraintException)
    {
      return ValueOrErrorResult<EntryCategoryEntity, StoreEntryCategoryError>.CreateFailure(StoreEntryCategoryError.DuplicateName);
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Unexpected error whilst storing new entry category");
      return ValueOrErrorResult<EntryCategoryEntity, StoreEntryCategoryError>.CreateFailure(StoreEntryCategoryError.Unknown);
    }
  }
}