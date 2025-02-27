using Keepi.Core.Repositories;
using Keepi.Core.UseCases;

namespace Keepi.Core.Unit.Tests.UseCases;

public class RegisterUserUseCaseTests
{
    [Fact]
    public async Task Execute_creates_user_for_unknown_user_identity()
    {
        var context = new TestContext()
            .WithExistingUserResultFor(
                externalId: "external ID",
                emailAddress: "test@example.com",
                result: false)
            .WithStoreNewUserResult(
                externalId: "external ID",
                emailAddress: "test@example.com",
                name: "Piet Hein",
                identityProvider: RegisterUserIdentityProvider.GitHub);

        var useCase = context.BuildUseCase();

        var result = await useCase.Execute(
            externalId: "external ID",
            emailAddress: "test@example.com",
            name: "Piet Hein",
            provider: RegisterUserIdentityProvider.GitHub,
            cancellationToken: CancellationToken.None);

        result.ShouldBe(RegisterUserUseCaseResult.UserCreated);

        context.StoreNewUserMock.Verify(x => x.Execute("external ID", "test@example.com", "Piet Hein", RegisterUserIdentityProvider.GitHub, It.IsAny<CancellationToken>()));
    }

    [Fact]
    public async Task Execute_does_not_create_user_for_already_known_user_identity()
    {
        var context = new TestContext()
            .WithExistingUserResultFor(
                externalId: "external ID",
                emailAddress: "test@example.com",
                result: true)
            .WithStoreNewUserResult(
                externalId: "external ID",
                emailAddress: "test@example.com",
                name: "Piet Hein",
                identityProvider: RegisterUserIdentityProvider.GitHub);

        var useCase = context.BuildUseCase();

        var result = await useCase.Execute(
            externalId: "external ID",
            emailAddress: "test@example.com",
            name: "Piet Hein",
            provider: RegisterUserIdentityProvider.GitHub,
            cancellationToken: CancellationToken.None);

        result.ShouldBe(RegisterUserUseCaseResult.UserAlreadyExists);

        context.StoreNewUserMock.VerifyNoOtherCalls();
    }

    class TestContext
    {
        public Mock<IGetUserExists> GetUserExistsMock { get; } = new(MockBehavior.Strict);
        public Mock<IStoreNewUser> StoreNewUserMock { get; } = new(MockBehavior.Strict);

        public TestContext WithExistingUserResultFor(string externalId, string emailAddress, bool result)
        {
            GetUserExistsMock
                .Setup(x => x.Execute(externalId, emailAddress, It.IsAny<CancellationToken>()))
                .ReturnsAsync(result);

            return this;
        }

        public TestContext WithStoreNewUserResult(
            string externalId,
            string emailAddress,
            string name,
            RegisterUserIdentityProvider identityProvider)
        {
            StoreNewUserMock
                .Setup(x => x.Execute(externalId, emailAddress, name, identityProvider, It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            return this;
        }

        public RegisterUserUseCase BuildUseCase() => new(
            getUserExists: GetUserExistsMock.Object,
            storeNewUser: StoreNewUserMock.Object);
    }
}
