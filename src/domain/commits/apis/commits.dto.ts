interface Commit {
  id: string;
  commitId: string;
  repo: string;
  branch: string;
  author: string;
  commitMessage: string;
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
  createdDateFrom?: string;
  createdDateTo?: string;
};

export type { Commit, CommitSearchRequest };
