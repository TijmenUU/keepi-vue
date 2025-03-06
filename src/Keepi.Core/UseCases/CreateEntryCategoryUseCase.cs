using Keepi.Core.Repositories;

namespace Keepi.Core.UseCases;

public enum CreateEntryCategoryUseCaseError
{
  Unknown,
  MalformedName,
  DuplicateName,
  InvalidActiveDateRange,
}

public record CreateEntryCategoryUseCaseResult(int EntryCategoryId);

public interface ICreateEntryCategoryUseCase
{
  Task<IValueOrErrorResult<CreateEntryCategoryUseCaseResult, CreateEntryCategoryUseCaseError>> Execute(
    int userId,
    string name,
    bool enabled,
    DateOnly? activeFrom,
    DateOnly? activeTo,
    CancellationToken cancellationToken);
}

internal class CreateEntryCategoryUseCase(IStoreEntryCategory storeEntryCategory)
 : ICreateEntryCategoryUseCase
{
  public async Task<IValueOrErrorResult<CreateEntryCategoryUseCaseResult, CreateEntryCategoryUseCaseError>> Execute(
    int userId,
    string name,
    bool enabled,
    DateOnly? activeFrom,
    DateOnly? activeTo,
    CancellationToken cancellationToken)
  {
    if (string.IsNullOrWhiteSpace(name) || name.Length > 64)
    {
      return ValueOrErrorResult<CreateEntryCategoryUseCaseResult, CreateEntryCategoryUseCaseError>.CreateFailure(CreateEntryCategoryUseCaseError.MalformedName);
    }

    if (activeFrom.HasValue && activeTo.HasValue && activeFrom > activeTo)
    {
      return ValueOrErrorResult<CreateEntryCategoryUseCaseResult, CreateEntryCategoryUseCaseError>.CreateFailure(CreateEntryCategoryUseCaseError.InvalidActiveDateRange);
    }

    var createResult = await storeEntryCategory.Execute(
      userId: userId,
      name: name,
      enabled: enabled,
      activeFrom: activeFrom,
      activeTo: activeTo,
      cancellationToken: cancellationToken);

    if (createResult.TrySuccess(out var success, out var error))
    {
      return ValueOrErrorResult<CreateEntryCategoryUseCaseResult, CreateEntryCategoryUseCaseError>.CreateSuccess(new CreateEntryCategoryUseCaseResult(
        EntryCategoryId: success.Id
      ));
    }

    if (error == StoreEntryCategoryError.DuplicateName)
    {
      return ValueOrErrorResult<CreateEntryCategoryUseCaseResult, CreateEntryCategoryUseCaseError>.CreateFailure(CreateEntryCategoryUseCaseError.DuplicateName);
    }

    return ValueOrErrorResult<CreateEntryCategoryUseCaseResult, CreateEntryCategoryUseCaseError>.CreateFailure(CreateEntryCategoryUseCaseError.Unknown);
  }
}