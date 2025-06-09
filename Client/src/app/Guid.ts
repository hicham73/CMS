export class Guid {
    public static create(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0; // Random integer between 0 and 15
        const value = char === 'x' ? random : (random & 0x3) | 0x8; // Ensure y (position 12) is 8, 9, A, or B
        return value.toString(16); // Convert to hexadecimal
      });
    }
  }