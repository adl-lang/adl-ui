export interface SelectState {
  current: number | null,
  active: boolean,
  choices: string[],
  onClick(): void;
  onChoice(i: number | null): void;
}

