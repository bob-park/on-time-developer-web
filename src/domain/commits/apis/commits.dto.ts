interface Commit {
  id: string;
  commitId: string;
  repo: string;
  branch: string;
  author: string;
  userUniqueId: string;
  commitMessage: string;
  commitDate: string;
  createdDate: string;
  createdBy: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
}

type CommitSearchRequest = {
  repo?: string;
  branch?: string;
  author?: string;
  commitMessage?: string;
  commitDateFrom?: string;
  commitDateTo?: string;
};

export type { Commit, CommitSearchRequest };
