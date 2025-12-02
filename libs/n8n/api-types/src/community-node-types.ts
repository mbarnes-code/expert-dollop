/**
 * Community node types.
 */

export interface INodeTypeDescription {
  displayName: string;
  name: string;
  [key: string]: unknown;
}

export interface CommunityNodeType {
  authorGithubUrl: string;
  authorName: string;
  checksum: string;
  description: string;
  displayName: string;
  name: string;
  numberOfStars: number;
  numberOfDownloads: number;
  packageName: string;
  createdAt: string;
  updatedAt: string;
  npmVersion: string;
  isOfficialNode: boolean;
  companyName?: string;
  nodeDescription: INodeTypeDescription;
  isInstalled: boolean;
  nodeVersions?: Array<{ npmVersion: string; checksum: string }>;
}
