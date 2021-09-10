class VcError {
	message?: string;
	
	constructor(target: string, message: any) {
		if (!message || !target) return;
		
		message = `[@wya/vc - ${target}]: ${message}`;
		this.message = message;

		process.env.NODE_ENV === 'development' && console.error(message);
	}
}

export default VcError;
