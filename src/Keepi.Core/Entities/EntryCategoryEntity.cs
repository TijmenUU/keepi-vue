namespace Keepi.Core.Entities;

public sealed class EntryCategoryEntity
{
  public EntryCategoryEntity(
    int id,
    string name,
    bool enabled,
    DateOnly? activeFrom,
    DateOnly? activeTo)
  {
    Id = id;
    Name = name;
    Enabled = enabled;
    ActiveFrom = activeFrom;
    ActiveTo = activeTo;
  }

  public int Id { get; }
  public string Name { get; set; }
  public bool Enabled { get; set; }
  public DateOnly? ActiveFrom { get; set; }
  public DateOnly? ActiveTo { get; set; }
}