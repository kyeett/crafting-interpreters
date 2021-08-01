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

class Token {
    type: TokenType
    lexeme: string
    line: number

    constructor(type: TokenType, lexeme: string, line: number) {
        this.type = type
        this.lexeme = lexeme
        this.line = line
    }

    toString() {
        return `${TokenType[this.type]} ${this.lexeme}`
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
                // Do nothing
                break
            case '(':
                this.addToken(TokenType.LEFT_PAREN);
                break;
            case ')':
                this.addToken(TokenType.RIGHT_PAREN);
                break;
            case '{':
                this.addToken(TokenType.LEFT_BRACE);
                break;
            case '}':
                this.addToken(TokenType.RIGHT_BRACE);
                break;
            case ',':
                this.addToken(TokenType.COMMA);
                break;
            case '.':
                this.addToken(TokenType.DOT);
                break;
            case '-':
                this.addToken(TokenType.MINUS);
                break;
            case '+':
                this.addToken(TokenType.PLUS);
                break;
            case ';':
                this.addToken(TokenType.SEMICOLON);
                break;
            case '*':
                this.addToken(TokenType.STAR);
                break;

            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.EQUAL);
                break;

            default:
                if (isDigit(c)) {
                    this.number();
                    // } else if (isAlpha(c)) {
                    //     this.identifier();
                } else {
                    error(this.line, `Unexpected character "${c}"`);
                }
                break
        }
    }

    private addToken(type: TokenType) {

        const text = this.source.substring(this.start, this.current)
        // console.log("add", TokenType[type], `"${text}"`, this.start, this.current, this.line)
        this.tokens.push(new Token(type, text, this.line))
    }

    isAtEnd() {
        return this.current >= this.source.length
    }

    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current
            this.scanToken()
        }

        this.tokens.push(new Token(TokenType.EOF, "", -1))
        return this.tokens
    }

    private number() {
        while (isDigit(this.peek()))
            this.advance()

        console.log(this.peek(), this.peekNext())
        if (this.peek() == '.' && isDigit(this.peekNext())) {
            this.advance()

            while (isDigit(this.peek()))
                this.advance()
        }

        this.addToken(TokenType.NUMBER)
    }

    private peek() {
        if (this.isAtEnd()) return '\0';

        return this.source.charAt(this.current);
    }

    private peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';

        return this.source.charAt(this.current + 1);
    }
}

function error(line: number, message: string) {
    report(line, "", message)
}

function report(line: number, where: string, message: string) {
    process.stderr.write(`[line ${line}] Error ${where}: message`)
}

function run(source: string) {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()

    for (const token of tokens) {
        console.log(token.toString())
    }
}

run("(1234.4 != 15.2)")
