export class NoResultsFoundError extends Error {
	constructor() {
		super("No results found");
		this.name = "NoResultsFoundError";
	}
}
