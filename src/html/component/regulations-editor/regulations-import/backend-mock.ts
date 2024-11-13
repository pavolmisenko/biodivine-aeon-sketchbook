// Function that recevies 2 arrays of strings and returns a object with one array of strings and map of <string: string>

function checkForIssues(
  source: string[],
  target: string[]
): { issues: string[]; recommendations: Record<string, string[]> } {
  let distorred_source: string[] = [
    source[0] + "!",
    source[1] + "!",
    ...source.slice(2),
  ];
  let merged: Set<string> = new Set([...distorred_source, ...target]);
  let issues: string[] = [];
  let recommendations: Record<string, string[]> = {};
  for (let i = 0; i < source.length; i++) {
    for (let array in [source, target]) {
      if (!merged.has(array[i])) {
        issues.push(array[i]);
        if (!recommendations[array[i]]) {
          recommendations[array[i]] = [
            array[i] + "!",
            array[i] + "!!",
            array[i] + "!!!",
          ];
        }
      }
    }
  }
  return { issues, recommendations };

  // go through the source and target arrays and create array of issues, if issue
}
