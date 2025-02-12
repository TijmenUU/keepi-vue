#nullable disable
using Microsoft.EntityFrameworkCore;

namespace Keepi.Data.Entities;

[Index(nameof(Date))]
internal sealed class UserEntryEntity
{
  public int Id { get; set; }

  public int UserId { get; set; }
  public UserEntity User { get; set; }

  public int EntryCategoryId { get; set; }
  public EntryCategoryEntity EntryCategory { get; set; }

  public DateOnly Date { get; set; }
  public int Minutes { get; set; }
  public string Remark { get; set; }
}