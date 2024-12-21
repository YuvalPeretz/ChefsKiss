enum StorageKeys {
  AUTHOR = "Author",
}

export default class Storage {
  static setIsAuthor() {
    localStorage.setItem(StorageKeys.AUTHOR, JSON.stringify(true));
  }

  static getIsAuthor() {
    try {
      return JSON.parse(localStorage.getItem(StorageKeys.AUTHOR) || "") || false;
    } catch (error) {
      return false;
    }
  }
}
