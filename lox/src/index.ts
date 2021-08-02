enum TokenType {
    // Single-character tokens.
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
    COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,

    // One or two character tokens.
    BANG, BANG_EQUAL,
    EQUAL, EQUAL_EQUAL,
    GREATER, GREATER_EQUAL,
    LESS, LESS_EQUAL,

    // Literals.
    IDENTIFIER, STRING, NUMBER,

    // Keywords.
    AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
    PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

    EOF
}

let keywords = new Map([
    ["and", TokenType.AND],
    ["class", TokenType.CLASS],
    ["else", TokenType.ELSE],
    ["false", TokenType.FALSE],
    ["for", TokenType.FOR],
    ["fun", TokenType.FUN],
    ["if", TokenType.IF],
    ["nil", TokenType.NIL],
    ["or", TokenType.OR],
    ["print", TokenType.PRINT],
    ["return", TokenType.RETURN],
    ["super", TokenType.SUPER],
    ["this", TokenType.THIS],
    ["true", TokenType.TRUE],
    ["var", TokenType.VAR],
    ["while", TokenType.WHILE],
])

class Token {
    constructor(readonly type: TokenType,
                readonly lexeme: string,
                readonly literal: number | string | null,
                readonly line: number) {
    }


    toString() {
        return `${TokenType[this.type]} ${this.lexeme} at line ${this.line}`
    }
}

function isDigit(c: string) {
    return c >= '0' && c <= '9';
}

function isAlpha(c: string) {
    return (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        c == '_';
}

function isAlphaNumeric(c: string) {
    return isAlpha(c) || isDigit(c);
}

class Scanner {
    source: string
    tokens: Token[]
    start = 0
    line = 1
    current = 0

    constructor(source: string) {
        this.source = source
        this.tokens = []
    }

    private advance() {
        return this.source.charAt(this.current++)
    }

    private match(wanted: string) {
        if (this.isAtEnd()) return false
        if (this.source.charAt(this.current) != wanted) return false

        this.current++
        return true
    }

    private scanToken() {
        // console.log("before", this.start, this.current)
        const c = this.advance()
        switch (c) {
            case ' ':
            case '\r':
            case '\t':
                // Do nothing
                break
            case '\n':
                this.line++
                break
            case '(':
                this.addTokenN(TokenType.LEFT_PAREN);
                break;
            case ')':
                this.addTokenN(TokenType.RIGHT_PAREN);
                break;
            case '{':
                this.addTokenN(TokenType.LEFT_BRACE);
                break;
            case '}':
                this.addTokenN(TokenType.RIGHT_BRACE);
                break;
            case ',':
                this.addTokenN(TokenType.COMMA);
                break;
            case '.':
                this.addTokenN(TokenType.DOT);
                break;
            case '-':
                this.addTokenN(TokenType.MINUS);
                break;
            case '+':
                this.addTokenN(TokenType.PLUS);
                break;
            case ';':
                this.addTokenN(TokenType.SEMICOLON);
                break;
            case '*':
                this.addTokenN(TokenType.STAR);
                break;

            case '!':
                this.addTokenN(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addTokenN(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addTokenN(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addTokenN(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '/':
                if (this.match('/')) {
                    // Advance until end of line
                    while (!this.isAtEnd() && this.peek() != '\n') this.advance()
                } else {
                    this.addTokenN(TokenType.SLASH);
                }
                break;
            case '"':
                this.string();
                break

            default:
                if (isDigit(c)) {
                    this.number();
                } else if (isAlpha(c)) {
                    this.identifier();
                } else {
                    error(this.line, `Unexpected character "${c}"`);
                }
                break
        }
    }

    private addTokenN(type: TokenType) {
        this.addToken(type, null)
    }

    private addToken(type: TokenType, literal: number | string | null) {
        const text = this.source.substring(this.start, this.current)
        // console.log("add", TokenType[type], `"${text}"`, this.start, this.current, this.line)
        this.tokens.push(new Token(type, text, literal, this.line))
    }

    isAtEnd() {
        return this.current >= this.source.length
    }

    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current
            this.scanToken()
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line))
        return this.tokens
    }

    private number() {
        while (isDigit(this.peek()))
            this.advance()

        // console.log(this.peek(), this.peekNext())
        if (this.peek() == '.' && isDigit(this.peekNext())) {
            this.advance()

            while (isDigit(this.peek()))
                this.advance()
        }

        let text = this.source.substring(this.start, this.current)
        this.addToken(TokenType.NUMBER, parseFloat(text))
    }

    private identifier() {
        while (isAlphaNumeric(this.peek())) this.advance();

        let text = this.source.substring(this.start, this.current)
        let type = keywords.get(text)
        if (type == null)
            type = TokenType.IDENTIFIER

        this.addTokenN(type);
    }

    private peek() {
        if (this.isAtEnd()) return '\0';

        return this.source.charAt(this.current);
    }

    private peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';

        return this.source.charAt(this.current + 1);
    }

    private string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++
            this.advance()
        }
        if (this.isAtEnd()) {
            error(this.line, "Unterminated string")
            return
        }
        this.advance()
        let value = this.source.substring(this.start + 1, this.current - 1)
        this.addToken(TokenType.STRING, value)
    }
}

function error(line: number, message: string) {
    report(line, "", message)
}

function report(line: number, where: string, message: string) {
    process.stderr.write(`[line ${line}] Error ${where}: ${message}`)
}

function run(source: string) {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()

    for (const token of tokens) {
        console.log(token.toString())
    }
}

run(`(1234.4 != 15.2)
// Comment
/ divided
or (1 == 2)
"magnus
`)
