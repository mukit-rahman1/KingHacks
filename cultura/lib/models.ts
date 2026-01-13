export type AccountType = "individual" | "organization";

export type Tag = {
  id: string;
  label: string;
};

export type IndividualProfile = {
  id: string;
  accountType: "individual";
  displayName: string;
  hobbies: Tag[];
  createdAt: string;
};

export type OrganizationProfile = {
  id: string;
  accountType: "organization";
  name: string;
  tags: Tag[];
  createdAt: string;
};

export type Event = {
  id: string;
  orgId: string;
  name: string;
  description: string;
  tags: Tag[];
  startsAt: string;
  createdAt: string;
};
