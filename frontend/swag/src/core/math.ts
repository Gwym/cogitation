

type UnsignedInt = number
type Unsigned = number
type Integer = number
type Real = number
type Float = number

let LA = { // Minimalistic Linear Algeba

	// a + b
	sum(a: Vec3, b: Vec3): Vec3 {

		return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z)
	},
	// a - b
	sub(a: Vec3, b: Vec3): Vec3 {

		return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z)
	},

	// -a
	negate(a: Vec3): Vec3 {
		return new Vec3(-a.x, -a.y, -a.z)
	},

	// a: Vec3 * b: number
	multiplyScalar(v: Vec3, n: number) {

		return new Vec3(v.x * n, v.y * n, v.z * n)
	},

	// a: Vec3 * b: number
	divideScalar(v: Vec3, n: number) {

		console.assert(n !== 0); // TODO : Inf ?

		return new Vec3(v.x / n, v.y / n, v.z / n)
	},


	// outer product a ^ b
	cross(a: Vec3, b: Vec3) {

		return new Vec3(
			a.y * b.z - a.z * b.y,
			a.z * b.x - a.x * b.z,
			a.x * b.y - a.y * b.x
		)
	},

	isFinite(v: Vec3) {
		return isFinite(v.x) && isFinite(v.y) && isFinite(v.z)
	},

	isNumber(v: Vec3) {
		return !(isNaN(v.x) || isNaN(v.y) || isNaN(v.z))
	},

	multiplyVecElementwise(a: Vec3, b: Vec3) {

		return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z)

	}
}