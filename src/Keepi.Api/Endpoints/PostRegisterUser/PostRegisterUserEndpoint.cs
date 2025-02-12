using System.Security.Claims;
using FastEndpoints;
using Keepi.Core.UseCases;
using Microsoft.Extensions.Logging;

namespace Keepi.Api.Endpoints.PostRegisterUser;

public class PostRegisterUserEndpoint(
  IRegisterUserUseCase registerUserUseCase,
  ILogger<PostRegisterUserEndpoint> logger)
  : Endpoint<PostRegisterUserRequest, PostRegisterUserResponse>
{
  public override void Configure()
  {
    Post("/registeruser");
  }

  public override async Task HandleAsync(
    PostRegisterUserRequest request,
    CancellationToken cancellationToken)
  {
    var externalIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    if (string.IsNullOrWhiteSpace(externalIdClaim?.Value))
    {
      logger.LogDebug("Refusing to register user without a name identifier");

      await SendErrorsAsync(
        statusCode: 400,
        cancellation: cancellationToken);
      return;
    }
    if (externalIdClaim.Issuer != "github")
    {
      logger.LogDebug("Refusing to register non GitHub user");

      await SendErrorsAsync(
        statusCode: 400,
        cancellation: cancellationToken);
      return;
    }

    string? userName = User.Identity?.Name;
    if (!string.IsNullOrWhiteSpace(request.Name))
    {
      userName = request.Name;
    }

    string emailAddress = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? string.Empty;

    if (string.IsNullOrWhiteSpace(userName) || string.IsNullOrWhiteSpace(emailAddress))
    {
      logger.LogDebug("Refusing to register user without required claims present");

      await SendErrorsAsync(
        statusCode: 400,
        cancellation: cancellationToken);
      return;
    }

    var result = await registerUserUseCase.Execute(
      externalId: externalIdClaim.Value,
      emailAddress: emailAddress,
      name: userName,
      provider: RegisterUserIdentityProvider.GitHub,
      cancellationToken: cancellationToken);

    switch (result)
    {
      case RegisterUserUseCaseResult.UserAlreadyExists:
        logger.LogDebug("Attempted to register a user that is already known");
        await SendAsync(
          response: new PostRegisterUserResponse(PostRegisterUserResponseResult.UserAlreadyExists),
          cancellation: cancellationToken);
        return;

      case RegisterUserUseCaseResult.UserCreated:
        await SendAsync(
          response: new PostRegisterUserResponse(PostRegisterUserResponseResult.Created),
          cancellation: cancellationToken);
        return;

      default:
        throw new NotImplementedException($"No handling implemented for user registration result {result}");
    }
  }
}