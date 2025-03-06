using Keepi.Core.Repositories;
using Keepi.Core.UseCases;

namespace Keepi.Core.Unit.Tests.UseCases;

public class CreateEntryCategoryUseCaseTests
{
  [Fact]
  public async Task Execute_stores_expected_entity_for_valid_input()
  {
    var context = new TestContext()
      .WithSuccesfulEntryCategoryStore(new Entities.EntryCategoryEntity(
          id: 13,
          name: "Dev",
          enabled: true,
          activeFrom: new DateOnly(2024, 4, 25),
          activeTo: new DateOnly(2024, 12, 31)));

    var useCase = context.BuildUseCase();

    var result = await useCase.Execute(
      userId: 42,
      name: "Dev",
      enabled: true,
      activeFrom: new DateOnly(2024, 4, 25),
      activeTo: new DateOnly(2024, 12, 31),
      cancellationToken: CancellationToken.None);

    result.Succeeded.ShouldBeTrue();
    result.SuccessOrThrow.EntryCategoryId.ShouldBe(13);
  }

  class TestContext
  {
    public Mock<IStoreEntryCategory> StoreEntryCategoryMock { get; } = new(MockBehavior.Strict);

    public TestContext WithSuccesfulEntryCategoryStore(Entities.EntryCategoryEntity returnedEntity)
    {
      StoreEntryCategoryMock
        .Setup(x => x.Execute(
          It.IsAny<int>(),
          It.IsAny<string>(),
          It.IsAny<bool>(),
          It.IsAny<DateOnly?>(),
          It.IsAny<DateOnly?>(),
          It.IsAny<CancellationToken>()))
        .ReturnsAsync(ValueOrErrorResult<Entities.EntryCategoryEntity, StoreEntryCategoryError>.CreateSuccess(returnedEntity));

      return this;
    }

    public CreateEntryCategoryUseCase BuildUseCase()
      => new(storeEntryCategory: StoreEntryCategoryMock.Object);
  }
}