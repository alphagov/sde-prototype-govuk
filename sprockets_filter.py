from __future__ import annotations

from functools import cache
from itertools import chain
from pathlib import Path

from webassets.filter import Filter


class Directive:
    want_directory = False

    def __init__(self, parser: Sprockets, source: Path, *args) -> None:
        self.parser = parser
        self.source = source
        if args:
            self.path = Path(args[0])
            self.resolved_path = parser.resolve_path(
                self.path,
                current_file_path=self.source,
                is_dir=self.want_directory,
            )

    @classmethod
    def build(
        cls,
        sprockets: Sprockets,
        source: Path,
        name: str,
        *args,
    ) -> Directive:
        directive_class_name = "".join(_.title() for _ in name.split("_"))
        try:
            directive_class = next(
                subclass
                for subclass in Directive.__subclasses__()
                if subclass.__name__ == directive_class_name
            )
        except StopIteration:
            raise ValueError(f"Unknown directive {name}")
        return directive_class(sprockets, source, *args)

    def apply(self, out) -> None:
        raise NotImplemented


class Require(Directive):
    """
    Inserts the contents of the asset source file specified by `path`. If the file is
    required multiple times, it will appear in the bundle only once.
    """

    def apply(self, out) -> None:
        self.require_file(self.resolved_path, out)

    def require_file(self, path: Path, out) -> None:
        if path not in self.parser.already_required:
            self.parser.already_required.add(path)
            self.parser.process_file(path, out)


class RequireTree(Require, Directive):
    """
    Recursively require all files in all subdirectories of the directory specified by
    `path`.
    """

    want_directory = True

    def apply(self, out) -> None:
        self.require_tree(self.resolved_path, out)

    def require_tree(self, path: Path, out) -> None:
        for file in sorted(path.iterdir(), key=str):
            if file.is_dir():
                self.require_tree(file, out)
            elif file.suffix == self.source.suffix:
                self.require_file(file, out)


class Sprockets(Filter):
    name = "sprockets"
    max_debug_level = None

    def __init__(self, *args, includes: list[str] | None = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.includes = [Path(dir).resolve() for dir in includes or []]
        self.already_required: set[Path] = set()
        self.source: Path | None = None

    def __hash__(self):
        return id(self)

    def process_file(self, path: Path, out) -> None:
        with path.open() as asset_file:
            out.write(";\n")
            for line in asset_file:
                if line.startswith("//= "):
                    Directive.build(self, path, *line[4:].strip().split(" ")).apply(out)
                else:
                    out.write(line)

    def input(self, _in, out, source, **kwargs):
        self.source = self.resolve_path(source)
        self.process_file(self.source, out)

    @cache
    def resolve_path(
        self,
        path: Path | str,
        current_file_path: Path | None = None,
        is_dir: bool = False,
    ) -> Path:
        test = Path.is_dir if is_dir else Path.is_file
        if isinstance(path, str):
            path = Path(path)

        variants = [path]
        if not is_dir and not path.suffix and self.source:
            variants.append(path.with_suffix(self.source.suffix))

        search_paths = chain(
            [current_file_path.parent] if current_file_path else [],
            [Path(self.ctx.environment.directory)],
            self.includes,
        )

        for search_path in search_paths:
            for variant in variants:
                candidate = search_path / variant

                if candidate in self.already_required or test(candidate):
                    return candidate

        raise ValueError(f"{path} not found")
