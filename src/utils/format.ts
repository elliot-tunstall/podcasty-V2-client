export function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  const formattedDuration = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  return formattedDuration
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}