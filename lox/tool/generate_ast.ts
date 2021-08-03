import {defineAst} from './generator'

if(process.argv.length != 3) {
    console.error('Usage: generate_ast.ts <output directory>');
    process.exit(64)
}

const filePath = process.argv[2] + "/expr.generated.ts"

defineAst(filePath, "Expr", [
    "Binary   : Expr left, Token operator, Expr right",
    "Grouping : Expr expression",
    "Literal  : Object value",
    "Unary    : Token operator, Expr right"
])

console.log(`Successfully created file ${filePath}`)
