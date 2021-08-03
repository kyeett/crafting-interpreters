abstract class Expr {
}

class Binary extends Expr {
    constructor(readonly left: Expr, readonly operator: Token, readonly right: Expr) {
        super()
    }
}

class Grouping extends Expr {
    constructor(readonly expression: Expr) {
        super()
    }
}

class Literal extends Expr {
    constructor(readonly value: Object) {
        super()
    }
}

class Unary extends Expr {
    constructor(readonly operator: Token, readonly right: Expr) {
        super()
    }
}
