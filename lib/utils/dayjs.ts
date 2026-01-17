import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function formatTimeToTimeSpent(time: number): string {
  return dayjs.duration(time).format("HH:mm:ss.SSS");
}
