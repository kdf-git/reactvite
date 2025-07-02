export default function ChoreChartDownload() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Thanks for signing up!</h1>
      <p className="mb-4 text-center">Click the button below to download your printable chore chart.</p>
      <a href="/printable-chore-chart.pdf" className="text-primary underline" download>
        Download Chore Chart
      </a>
    </div>
  );
}
