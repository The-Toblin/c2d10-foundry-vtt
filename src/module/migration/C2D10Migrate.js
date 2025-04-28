import { migrateTo0610 } from "./migrate0610.js";

export const migrate = async version => {
  if (foundry.utils.isNewerVersion(0.610, version)) {
    await migrateTo0610();
  }
};
