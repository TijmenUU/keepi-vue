namespace Keepi.Api.Endpoints.GetUserEntryCategories;

public class GetUserEntryCategoriesResponse(GetUserEntryCategoriesResponseCategory[] entryCategories)
{
  public GetUserEntryCategoriesResponseCategory[] Categories { get; } = entryCategories;
}

public class GetUserEntryCategoriesResponseCategory(int id, string name, bool enabled, DateOnly? activeFrom, DateOnly? activeTo)
{
  public int Id { get; } = id;
  public string Name { get; } = name;
  public bool Enabled { get; } = enabled;
  public DateOnly? ActiveFrom { get; } = activeFrom;
  public DateOnly? ActiveTo { get; } = activeTo;
}