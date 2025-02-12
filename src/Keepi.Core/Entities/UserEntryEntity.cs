namespace Keepi.Core.Entities;

public sealed class UserEntryEntity
{
  public UserEntryEntity(
    int id,
    int userId,
    int entryCategoryId,
    DateOnly date,
    int minutes,
    string? remark)
  {
    Id = id;
    UserId = userId;
    EntryCategoryId = entryCategoryId;
    Date = date;
    Minutes = minutes;
    Remark = remark;
  }

  public int Id { get; }
  public int UserId { get; }
  public int EntryCategoryId { get; }
  public DateOnly Date { get; set; }
  public int Minutes { get; set; }
  public string? Remark { get; set; }
}