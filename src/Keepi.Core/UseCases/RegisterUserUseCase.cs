using Keepi.Core.Repositories;

namespace Keepi.Core.UseCases;

public enum RegisterUserUseCaseResult
{
  UserAlreadyExists,
  UserCreated,
};

public enum RegisterUserIdentityProvider
{
  GitHub,
}

public interface IRegisterUserUseCase
{
  Task<RegisterUserUseCaseResult> Execute(
    string externalId,
    string emailAddress,
    string name,
    RegisterUserIdentityProvider provider,
    CancellationToken cancellationToken);
}

internal class RegisterUserUseCase(
  IGetUserExists getUserExists,
  IStoreNewUser storeNewUser)
  : IRegisterUserUseCase
{
  public async Task<RegisterUserUseCaseResult> Execute(
    string externalId,
    string emailAddress,
    string name,
    RegisterUserIdentityProvider provider,
    CancellationToken cancellationToken)
  {
    if (await getUserExists.UserExists(
      externalId: externalId,
      emailAddress: emailAddress,
      cancellationToken: cancellationToken))
    {
      return RegisterUserUseCaseResult.UserAlreadyExists;
    }

    await storeNewUser.Store(
      externalId: externalId,
      emailAddress: emailAddress,
      name: name,
      userIdentityProvider: provider,
      cancellationToken: cancellationToken);

    return RegisterUserUseCaseResult.UserCreated;
  }
}