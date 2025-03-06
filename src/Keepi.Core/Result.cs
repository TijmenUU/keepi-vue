using System.Diagnostics.CodeAnalysis;

namespace Keepi.Core;

public interface IResult
{
  bool Succeeded { get; }
}

public interface IMaybeErrorResult<TError> : IResult
{
  bool TrySuccess(
    [NotNullWhen(returnValue: false)] out TError? error);
}

public interface IValueOrErrorResult<TSuccess, TError> : IResult
{
  bool TrySuccess(
    [NotNullWhen(returnValue: true)] out TSuccess? success,
    [NotNullWhen(returnValue: false)] out TError? error);
  TSuccess SuccessOrThrow { get; }
}

public class MaybeErrorResult<TError>
  : IMaybeErrorResult<TError>
{
  private readonly bool succeeded;
  private readonly TError? error;

  public bool Succeeded => succeeded;

  private MaybeErrorResult(bool succeeded, TError? error)
  {
    if (!succeeded && error == null)
    {
      throw new ArgumentNullException(message: $"NULL error result is not supported on failure", paramName: nameof(error));
    }

    this.succeeded = succeeded;
    this.error = error;
  }

  public static IMaybeErrorResult<TError> CreateSuccess()
  {
    return new MaybeErrorResult<TError>(
      succeeded: true,
      error: default);
  }

  public static IMaybeErrorResult<TError> CreateFailure(TError value)
  {
    return new MaybeErrorResult<TError>(
      succeeded: false,
      error: value);
  }

  public bool TrySuccess([NotNullWhen(false)] out TError? error)
  {
    error = this.error;
    return succeeded;
  }
}

public class ValueOrErrorResult<TSuccess, TError>
  : IValueOrErrorResult<TSuccess, TError>
{
  private readonly bool succeeded;
  private readonly TSuccess? success;
  private readonly TError? error;

  public bool Succeeded => succeeded;

  private ValueOrErrorResult(bool succeeded, TSuccess? success, TError? error)
  {
    if (succeeded && success == null)
    {
      throw new ArgumentNullException(message: $"NULL success result is not supported on success", paramName: nameof(success));
    }
    if (!succeeded && error == null)
    {
      throw new ArgumentNullException(message: $"NULL error result is not supported on failure", paramName: nameof(error));
    }

    this.succeeded = succeeded;
    this.success = success;
    this.error = error;
  }

  public static IValueOrErrorResult<TSuccess, TError> CreateSuccess(TSuccess value)
  {
    return new ValueOrErrorResult<TSuccess, TError>(
      succeeded: true,
      success: value,
      error: default);
  }

  public static IValueOrErrorResult<TSuccess, TError> CreateFailure(TError value)
  {
    return new ValueOrErrorResult<TSuccess, TError>(
      succeeded: false,
      success: default,
      error: value);
  }

  public bool TrySuccess([NotNullWhen(true)] out TSuccess? success, [NotNullWhen(false)] out TError? error)
  {
    success = this.success;
    error = this.error;
    return succeeded;
  }

  public TSuccess SuccessOrThrow
  {
    get
    {
      if (!succeeded || success == null)
      {
        throw new InvalidOperationException("Non succesful result cannot return a success value");
      }

      return success;
    }
  }
}