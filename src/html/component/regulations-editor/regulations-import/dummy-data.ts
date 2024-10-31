export type DataRecord = Partial<Record<string, string>>;

const dummyResponse = {
  headers: [
    "column1",
    "column2",
    "column3",
    "column4",
    "column5",
    "column6",
    "column7",
    "column8",
    "column9",
  ],
  data: [
    {
      column1: "GeneA",
      column2: "activation",
      column3: "GeneB",
      column4: "GeneC",
    },
    {
      column1: "GeneB",
      column2: "inhibition",
      column3: "GeneC",
      column4: "GeneA",
      column5: "ProteinX",
      column6: "ProteinY",
      column7: "ProteinZ",
      column8: "GeneXX",
      column9: "GeneYY",
    },
    {
      column1: "ProteinX",
      column2: "binding",
      column3: "ProteinY",
      column5: "ProteinZ",
    },
    {
      column1: "GeneA",
      column2: "expression",
      column3: "ProteinX",
    },
    {
      column1: "GeneC",
      column2: "phosphorylation",
      column3: "ProteinZ",
    },
    {
      column1: "GeneD",
      column2: "inhibition",
      column3: "GeneA",
    },
    {
      column1: "ProteinY",
      column2: "activation",
      column3: "ProteinZ",
    },
    {
      column1: "ProteinZ",
      column2: "activation",
      column3: "GeneXX",
    },
    {
      column1: "GeneYY",
      column2: "activation",
      column3: "ProteinZ",
    },
  ],
};

export const getDummyData = async () => {
  // sleep 2 seconds to simulate backend request
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return dummyResponse;
};
