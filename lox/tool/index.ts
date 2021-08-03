import {Project} from "ts-morph";

const outputDir = "src"

function defineAst(outputDir: string, baseName: string, types: string[]) {
    const project = new Project({});
    let myClassFile = project.createSourceFile(outputDir + "/expr.generated.ts", "", {overwrite: true})

    myClassFile.addClass({name: baseName, isAbstract: true})

    for (const type of types) {
        // Parse definitions
        const className = type.split(":")[0].trim()
        const fields = type.split(":")[1].trim()
        const parameters = fields.split(', ').map((value, index) => {
            return {name: value.split(' ')[1], type: value.split(' ')[0], isReadonly: true}
        })

        // Create class
        const cls = myClassFile.addClass({name: className})
        cls.addConstructor({
            parameters: parameters,
            statements: ["super()"]
        })
        cls.setExtends(baseName)
    }
    project.saveSync()
}

defineAst(outputDir, "Expr", [
    "Binary   : Expr left, Token operator, Expr right",
    "Grouping : Expr expression",
    "Literal  : Object value",
    "Unary    : Token operator, Expr right"
])
