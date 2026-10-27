#!/usr/bin/env python3
"""Portable Spec Kit project helpers."""

from __future__ import annotations

import argparse
import json
import os
import re
import shlex
import sys
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any


def error(message: str) -> None:
    print(message, file=sys.stderr)


def repo_root() -> Path:
    init_dir = os.environ.get("SPECIFY_INIT_DIR")
    if init_dir:
        root = Path(init_dir)
        if not root.is_absolute():
            root = Path.cwd() / root
        if not root.is_dir():
            raise ValueError(f"ERROR: SPECIFY_INIT_DIR does not point to an existing directory: {init_dir}")
        root = root.resolve()
        if not (root / ".specify").is_dir():
            raise ValueError(f"ERROR: SPECIFY_INIT_DIR is not a Spec Kit project (no .specify/ directory): {root}")
        return root

    for candidate in (Path.cwd(), *Path.cwd().parents):
        if (candidate / ".specify").is_dir():
            return candidate.resolve()
    return Path(__file__).resolve().parents[3]


def compact_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def feature_paths(no_persist: bool = False, return_null_on_error: bool = False) -> dict[str, Path | str] | None:
    try:
        root = repo_root()
        feature_json = root / ".specify" / "feature.json"
        feature_value = os.environ.get("SPECIFY_FEATURE_DIRECTORY")
        if feature_value:
            feature_dir = Path(feature_value)
            if not feature_dir.is_absolute():
                feature_dir = root / feature_dir
            if not (no_persist or os.environ.get("SPECIFY_FEATURE_NO_PERSIST", "").lower() in ("1", "true")):
                save_feature_json(root, feature_value)
        elif feature_json.exists():
            try:
                config = json.loads(feature_json.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as exc:
                raise ValueError(
                    "ERROR: Feature directory not found. Set SPECIFY_FEATURE_DIRECTORY or ensure "
                    ".specify/feature.json contains feature_directory."
                ) from exc
            feature_value = config.get("feature_directory") if isinstance(config, dict) else None
            if not feature_value:
                raise ValueError(
                    "ERROR: Feature directory not found. Set SPECIFY_FEATURE_DIRECTORY or ensure "
                    ".specify/feature.json contains feature_directory."
                )
            feature_dir = Path(feature_value)
            if not feature_dir.is_absolute():
                feature_dir = root / feature_dir
        else:
            raise ValueError(
                "ERROR: Feature directory not found. Set SPECIFY_FEATURE_DIRECTORY or run the specify "
                "command to create .specify/feature.json."
            )

        branch = os.environ.get("SPECIFY_FEATURE") or feature_dir.name
        return {
            "REPO_ROOT": str(root),
            "CURRENT_BRANCH": branch,
            "FEATURE_DIR": str(feature_dir),
            "FEATURE_SPEC": str(feature_dir / "spec.md"),
            "IMPL_PLAN": str(feature_dir / "plan.md"),
            "TASKS": str(feature_dir / "tasks.md"),
            "RESEARCH": str(feature_dir / "research.md"),
            "DATA_MODEL": str(feature_dir / "data-model.md"),
            "QUICKSTART": str(feature_dir / "quickstart.md"),
            "CONTRACTS_DIR": str(feature_dir / "contracts"),
        }
    except ValueError as exc:
        error(str(exc))
        if return_null_on_error:
            return None
        raise


def save_feature_json(root: Path, feature_directory: str) -> None:
    feature_dir = Path(feature_directory)
    if feature_dir.is_absolute():
        try:
            feature_directory = feature_dir.relative_to(root).as_posix()
        except ValueError:
            pass
    target = root / ".specify" / "feature.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    existing = None
    if target.is_file():
        try:
            existing = json.loads(target.read_text(encoding="utf-8")).get("feature_directory")
        except (OSError, json.JSONDecodeError, AttributeError):
            pass
    if existing != feature_directory:
        target.write_text(compact_json({"feature_directory": feature_directory}), encoding="utf-8")


def _priority(value: Any) -> int:
    if isinstance(value, bool):
        return 10
    if isinstance(value, int):
        return value if value >= 1 else 10
    if isinstance(value, str) and re.fullmatch(r"[+-]?[0-9]+(?:_[0-9]+)*", value.strip()):
        parsed = int(value.strip().replace("_", ""))
        return parsed if parsed >= 1 else 10
    return 10


def _registry_presets(directory: Path) -> list[str]:
    registry = directory / ".registry"
    if registry.is_file():
        try:
            data = json.loads(registry.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                raise ValueError("Registry root must be an object")
            presets = data.get("presets", {})
            if not isinstance(presets, dict):
                raise ValueError("Registry presets must be an object")
            active = [
                (entry.get("priority", 10), name)
                for name, entry in presets.items()
                if re.fullmatch(r"[a-z0-9-]+", name)
                and isinstance(entry, dict)
                and entry.get("enabled") is not False
            ]
            return [name for _, name in sorted((_priority(p), n) for p, n in active)]
        except (OSError, json.JSONDecodeError, ValueError):
            pass
    return sorted(
        entry.name for entry in directory.iterdir()
        if entry.is_dir() and re.fullmatch(r"[a-z0-9-]+", entry.name)
    )


def _extension_ids(directory: Path) -> list[str]:
    registered: dict[str, Any] = {}
    registry = directory / ".registry"
    if registry.exists() or registry.is_symlink():
        if not registry.is_file():
            raise ValueError(f"Invalid extension registry {registry}: not a regular file")
        try:
            data = json.loads(registry.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise ValueError(f"Invalid extension registry {registry}: {exc}") from exc
        if not isinstance(data, dict):
            raise ValueError(f"Invalid extension registry {registry}: root must be a mapping")
        extensions = data.get("extensions", {})
        if not isinstance(extensions, dict):
            raise ValueError(f"Invalid extension registry {registry}: 'extensions' must be a mapping")
        registered = extensions

    ranked: list[tuple[int, str]] = []
    for name, entry in registered.items():
        if not re.fullmatch(r"[a-z0-9-]+", name) or not isinstance(entry, dict):
            continue
        if entry.get("enabled") is False:
            continue
        ranked.append((_priority(entry.get("priority", 10)), name))
    for entry in directory.iterdir():
        if entry.is_dir() and re.fullmatch(r"[a-z0-9-]+", entry.name) and entry.name not in registered:
            ranked.append((10, entry.name))
    return [name for _, name in sorted(ranked)]


def _manifest_template(manifest: Path, template_name: str) -> tuple[bool, str, str]:
    try:
        import yaml
    except ImportError as exc:
        raise ValueError("PyYAML is required to resolve preset template composition") from exc
    try:
        data = yaml.safe_load(manifest.read_text(encoding="utf-8"))
    except Exception as exc:
        raise ValueError(f"Invalid preset manifest {manifest}: {exc}") from exc
    if not isinstance(data, dict):
        raise ValueError(f"Invalid preset manifest {manifest}: manifest root must be a mapping")
    if "provides" not in data:
        raise ValueError(f"Invalid preset manifest {manifest}: manifest missing provides section")
    provides = data["provides"]
    if not isinstance(provides, dict):
        raise ValueError(f"Invalid preset manifest {manifest}: manifest provides must be a mapping")
    if "templates" not in provides:
        raise ValueError(f"Invalid preset manifest {manifest}: manifest provides missing templates")
    templates = provides["templates"]
    if not isinstance(templates, list):
        raise ValueError(f"Invalid preset manifest {manifest}: manifest templates must be a list")
    if not templates:
        raise ValueError(f"Invalid preset manifest {manifest}: manifest must provide at least one template")
    valid_types = ("template", "command", "script")
    valid_strategies = ("replace", "prepend", "append", "wrap")
    for item in templates:
        if not isinstance(item, dict):
            raise ValueError(f"Invalid preset manifest {manifest}: manifest template entries must be mappings")
        if any(key not in item for key in ("type", "name", "file")):
            raise ValueError(f"Invalid preset manifest {manifest}: manifest template entry missing type, name, or file")
        if any(not isinstance(item[key], str) for key in ("type", "name", "file")):
            raise ValueError(f"Invalid preset manifest {manifest}: manifest template fields must be strings")
        strategy = item.get("strategy", "replace")
        if item["type"] not in valid_types or not isinstance(strategy, str):
            raise ValueError(f"Invalid preset manifest {manifest}: invalid template type or strategy")
        strategy = strategy.lower()
        if strategy not in valid_strategies or (item["type"] == "script" and strategy not in ("replace", "wrap")):
            raise ValueError(f"Invalid preset manifest {manifest}: invalid template strategy")
    for item in templates:
        if item.get("name") == template_name and item.get("type", "template") == "template":
            return True, item.get("strategy", "replace").lower(), item["file"]
    return False, "replace", ""


def resolve_template_path(template_name: str, root: Path) -> Path | None:
    if not re.fullmatch(r"[a-z0-9-]+", template_name):
        return None
    base = root / ".specify" / "templates"
    override = base / "overrides" / f"{template_name}.md"
    if override.exists():
        return override
    presets = root / ".specify" / "presets"
    if presets.is_dir():
        for preset in _registry_presets(presets):
            for candidate in (
                presets / preset / "templates" / f"{template_name}.md",
                presets / preset / f"{template_name}.md",
            ):
                if candidate.is_file():
                    return candidate
    extensions = root / ".specify" / "extensions"
    if extensions.is_dir():
        for extension in _extension_ids(extensions):
            for candidate in (
                extensions / extension / "templates" / f"{template_name}.md",
                extensions / extension / f"{template_name}.md",
            ):
                if candidate.is_file():
                    return candidate
    core = base / f"{template_name}.md"
    return core if core.is_file() else None


def resolve_template_content(template_name: str, root: Path) -> str | None:
    if not re.fullmatch(r"[a-z0-9-]+", template_name):
        return None
    base = root / ".specify" / "templates"
    override = base / "overrides" / f"{template_name}.md"
    if override.is_file():
        return override.read_text(encoding="utf-8")

    paths: list[Path] = []
    strategies: list[str] = []
    effective_base_found = False
    presets = root / ".specify" / "presets"
    if presets.is_dir():
        for preset in _registry_presets(presets):
            manifest = presets / preset / "preset.yml"
            strategy, file_path, declared = "replace", "", False
            if manifest.is_file():
                declared, strategy, file_path = _manifest_template(manifest, template_name)
            candidate = None
            if file_path:
                relative = Path(file_path)
                if relative.is_absolute() or ".." in relative.parts:
                    relative = Path()
                if relative.parts:
                    path = presets / preset / relative
                    if path.is_file():
                        candidate = path
            if candidate is None and not declared:
                for path in (
                    presets / preset / "templates" / f"{template_name}.md",
                    presets / preset / f"{template_name}.md",
                ):
                    if path.is_file():
                        candidate = path
                        break
            if candidate:
                paths.append(candidate)
                strategies.append(strategy)
                if strategy == "replace":
                    effective_base_found = True
                    break

    extensions = root / ".specify" / "extensions"
    if not effective_base_found and extensions.is_dir():
        for extension in _extension_ids(extensions):
            for candidate in (
                extensions / extension / "templates" / f"{template_name}.md",
                extensions / extension / f"{template_name}.md",
            ):
                if candidate.is_file():
                    paths.append(candidate)
                    strategies.append("replace")
                    effective_base_found = True
                    break
            if effective_base_found:
                break

    core = base / f"{template_name}.md"
    if not effective_base_found and core.is_file():
        paths.append(core)
        strategies.append("replace")
    if not paths:
        return None
    if strategies[0] == "replace":
        return paths[0].read_text(encoding="utf-8")

    try:
        base_index = strategies.index("replace")
    except ValueError as exc:
        raise ValueError(f"Template '{template_name}' has composing layers but no replace base") from exc
    content = paths[base_index].read_text(encoding="utf-8")
    for path, strategy in reversed(list(zip(paths[:base_index], strategies[:base_index]))):
        layer = path.read_text(encoding="utf-8")
        if strategy == "prepend":
            content = f"{layer}\n\n{content}"
        elif strategy == "append":
            content = f"{content}\n\n{layer}"
        elif strategy == "wrap":
            if "{CORE_TEMPLATE}" not in layer:
                raise ValueError("Wrap strategy missing {CORE_TEMPLATE} placeholder")
            content = layer.replace("{CORE_TEMPLATE}", content)
        elif strategy == "replace":
            content = layer
        else:
            raise ValueError(f"Unknown strategy: {strategy}")
    return content


def add_json_option(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--json", "-Json", action="store_true")


def cmd_resolve_template(args: argparse.Namespace) -> int:
    if args.help:
        print("Usage: python3 .specify/scripts/python/speckit.py resolve-template TEMPLATE_NAME [--json]")
        return 0
    if not args.template_name:
        error("ERROR: Template name is required")
        return 1
    root = repo_root()
    content = resolve_template_content(args.template_name, root)
    if content is None:
        error(f"ERROR: Could not resolve required {args.template_name} from the template override stack for {root}")
        return 1
    if args.json:
        print(compact_json({"TEMPLATE_NAME": args.template_name, "TEMPLATE_CONTENT": content}))
    else:
        sys.stdout.write(content)
    return 0


def cmd_check_prerequisites(args: argparse.Namespace) -> int:
    paths = feature_paths(no_persist=args.paths_only)
    assert paths is not None
    if args.paths_only:
        result = {
            "REPO_ROOT": paths["REPO_ROOT"],
            "BRANCH": paths["CURRENT_BRANCH"],
            "FEATURE_DIR": paths["FEATURE_DIR"],
            "FEATURE_SPEC": paths["FEATURE_SPEC"],
            "IMPL_PLAN": paths["IMPL_PLAN"],
            "TASKS": paths["TASKS"],
        }
        if args.json:
            print(compact_json(result))
        else:
            for key, value in result.items():
                print(f"{key}: {value}")
        return 0

    feature_dir = Path(paths["FEATURE_DIR"])
    plan = Path(paths["IMPL_PLAN"])
    if not feature_dir.is_dir():
        error(f"ERROR: Feature directory not found: {feature_dir}")
        error("Run /speckit-specify first to create the feature structure.")
        return 1
    if not plan.is_file():
        error(f"ERROR: plan.md not found in {feature_dir}")
        error("Run /speckit-plan first to create the implementation plan.")
        return 1
    if plan.stat().st_size == 0:
        error(f"ERROR: plan.md is empty in {feature_dir}")
        error("Populate it, or remove the empty file and rerun /speckit-plan with a valid plan template.")
        return 1
    if args.require_spec and not Path(paths["FEATURE_SPEC"]).is_file():
        error(f"ERROR: spec.md not found in {feature_dir}")
        error("Run /speckit-specify first to create the feature specification.")
        return 1
    if args.require_tasks and not Path(paths["TASKS"]).is_file():
        error(f"ERROR: tasks.md not found in {feature_dir}")
        error("Run /speckit-tasks first to create the task list.")
        return 1

    docs = []
    for key, name in (("RESEARCH", "research.md"), ("DATA_MODEL", "data-model.md")):
        if Path(paths[key]).exists():
            docs.append(name)
    contracts = Path(paths["CONTRACTS_DIR"])
    if contracts.is_dir() and any(contracts.iterdir()):
        docs.append("contracts/")
    if Path(paths["QUICKSTART"]).exists():
        docs.append("quickstart.md")
    if args.include_tasks and Path(paths["TASKS"]).exists():
        docs.append("tasks.md")

    template_content = None
    if args.template:
        template_content = resolve_template_content(args.template, Path(paths["REPO_ROOT"]))
        if template_content is None:
            error(
                f"ERROR: Could not resolve required {args.template} from the template override stack "
                f"for {paths['REPO_ROOT']}"
            )
            return 1
    if args.json:
        result = {"FEATURE_DIR": paths["FEATURE_DIR"], "AVAILABLE_DOCS": docs}
        if args.template:
            result["TEMPLATE_CONTENT"] = template_content
        print(compact_json(result))
    else:
        print(f"FEATURE_DIR:{paths['FEATURE_DIR']}")
        print("AVAILABLE_DOCS:")
        for doc, key in (
            ("research.md", "RESEARCH"),
            ("data-model.md", "DATA_MODEL"),
            ("contracts/", "CONTRACTS_DIR"),
            ("quickstart.md", "QUICKSTART"),
        ):
            exists = Path(paths[key]).is_dir() and any(Path(paths[key]).iterdir()) if key == "CONTRACTS_DIR" else Path(paths[key]).is_file()
            print(f"  [{'OK' if exists else 'FAIL'}] {doc}")
        if args.include_tasks:
            exists = Path(paths["TASKS"]).is_file()
            print(f"  [{'OK' if exists else 'FAIL'}] tasks.md")
    return 0


def cmd_setup_plan(args: argparse.Namespace) -> int:
    paths = feature_paths(return_null_on_error=True)
    if paths is None:
        return 1
    feature_dir = Path(paths["FEATURE_DIR"])
    feature_dir.mkdir(parents=True, exist_ok=True)
    plan = Path(paths["IMPL_PLAN"])
    if plan.is_file():
        message = f"Plan already exists at {plan}, skipping template copy"
        print(message, file=sys.stderr if args.json else sys.stdout)
    else:
        content = resolve_template_content("plan-template", Path(paths["REPO_ROOT"]))
        if content is None:
            error("ERROR: Plan template not found; no new plan.md was created.")
            error("Restore a valid plan template and rerun plan setup.")
            return 1
        if not content:
            error("ERROR: Plan template is empty; no new plan.md was created.")
            error("Restore a valid plan template and rerun plan setup.")
            return 1
        plan.write_text(content, encoding="utf-8")
        message = f"Copied plan template to {plan}"
        print(message, file=sys.stderr if args.json else sys.stdout)
    result = {
        "FEATURE_SPEC": paths["FEATURE_SPEC"],
        "IMPL_PLAN": paths["IMPL_PLAN"],
        "FEATURE_DIR": paths["FEATURE_DIR"],
        "BRANCH": paths["CURRENT_BRANCH"],
    }
    if args.json:
        print(compact_json(result))
    else:
        for key, value in result.items():
            print(f"{key}: {value}")
    return 0


def cmd_setup_tasks(args: argparse.Namespace) -> int:
    paths = feature_paths(return_null_on_error=True)
    if paths is None:
        return 1
    feature_dir = Path(paths["FEATURE_DIR"])
    if not Path(paths["IMPL_PLAN"]).is_file():
        error(f"ERROR: plan.md not found in {feature_dir}")
        error("Run /speckit-plan first to create the implementation plan.")
        return 1
    if not Path(paths["FEATURE_SPEC"]).is_file():
        error(f"ERROR: spec.md not found in {feature_dir}")
        error("Run /speckit-specify first to create the feature structure.")
        return 1
    docs = [
        name for key, name in (
            ("RESEARCH", "research.md"),
            ("DATA_MODEL", "data-model.md"),
        ) if Path(paths[key]).exists()
    ]
    contracts = Path(paths["CONTRACTS_DIR"])
    if contracts.is_dir() and any(contracts.iterdir()):
        docs.append("contracts/")
    if Path(paths["QUICKSTART"]).exists():
        docs.append("quickstart.md")
    root = Path(paths["REPO_ROOT"])
    template_path = resolve_template_path("tasks-template", root)
    template_content = resolve_template_content("tasks-template", root)
    if template_content is None:
        error(
            f"ERROR: Could not resolve required tasks-template from the template override stack for {root}"
        )
        error(
            "Template 'tasks-template' was not found in any supported location (overrides, presets, "
            "extensions, or shared core). Add an override at "
            ".specify/templates/overrides/tasks-template.md, or run 'specify init' / reinstall shared "
            "infra to restore the core .specify/templates/tasks-template.md template."
        )
        return 1
    result = {
        "FEATURE_DIR": paths["FEATURE_DIR"],
        "AVAILABLE_DOCS": docs,
        "TASKS_TEMPLATE": str(template_path.resolve()) if template_path else "",
        "TASKS_TEMPLATE_CONTENT": template_content,
    }
    if args.json:
        print(compact_json(result))
    else:
        print(f"FEATURE_DIR: {paths['FEATURE_DIR']}")
        print(f"TASKS_TEMPLATE: {result['TASKS_TEMPLATE'] or 'not found'}")
        print("AVAILABLE_DOCS:")
        for name in ("research.md", "data-model.md", "contracts/", "quickstart.md"):
            print(f"  [{'OK' if name in docs else 'FAIL'}] {name}")
    return 0


MAX_BRANCH_LENGTH = 244
STOP_WORDS = set(
    "i a an the to for of in on at by with from is are was were be been being have has had "
    "do does did will would should could can may might must shall this that these those my "
    "your our their want need add get set".split()
)


def unicode_words(name: str, separator: str) -> str:
    result = []
    for char in name.lower():
        category = unicodedata.category(char)
        result.append(char if category.startswith("L") or category == "Nd" else separator)
    return "".join(result)


def clean_branch_name(name: str) -> str:
    return re.sub(r"-{2,}", "-", unicode_words(name, "-")).strip("-")


def feature_branch_suffix(description: str) -> str:
    words = unicode_words(description, " ").split()
    meaningful = []
    for word in words:
        if word in STOP_WORDS:
            continue
        if len(word) >= 3 or not word.isascii():
            meaningful.append(word)
        elif re.search(rf"(?<![0-9A-Za-z_]){re.escape(word.upper())}(?![0-9A-Za-z_])", description):
            meaningful.append(word)
    if meaningful:
        count = 4 if len(meaningful) == 4 else 3
        return "-".join(meaningful[:count])
    return "-".join(clean_branch_name(description).split("-")[:3])


def fitted_branch_name(number: str, suffix: str) -> str:
    name = f"{number}-{suffix}"
    if len(name.encode("utf-8")) <= MAX_BRANCH_LENGTH:
        return name
    max_bytes = MAX_BRANCH_LENGTH - len(number) - 1
    encoded = suffix.encode("utf-8")[:max_bytes]
    while encoded:
        try:
            truncated = encoded.decode("utf-8")
            break
        except UnicodeDecodeError:
            encoded = encoded[:-1]
    else:
        truncated = ""
    return f"{number}-{truncated.rstrip('-')}"


def cmd_create_new_feature(args: argparse.Namespace) -> int:
    description = " ".join(args.description).strip()
    if not description:
        error("Error: Feature description cannot be empty or contain only whitespace")
        return 1
    suffix = clean_branch_name(args.short_name) if args.short_name else feature_branch_suffix(description)
    root = repo_root()
    specs_dir = root / "specs"
    if not args.dry_run:
        specs_dir.mkdir(parents=True, exist_ok=True)
    has_number = args.number is not None
    if args.timestamp:
        if has_number:
            error("[specify] Warning: --number is ignored when --timestamp is used")
        number = datetime.now().strftime("%Y%m%d-%H%M%S")
    else:
        dirs = list(specs_dir.iterdir()) if specs_dir.is_dir() else []
        numbers = [
            int(match.group(1))
            for entry in dirs if entry.is_dir()
            if (match := re.match(r"^(\d{3,})-", entry.name))
            and not re.match(r"^\d{8}-\d{6}-", entry.name)
            and int(match.group(1)) <= 9223372036854775807
        ]
        highest = max(numbers, default=0)
        if args.number is None:
            resolved = highest + 1
        elif not re.fullmatch(r"[0-9]+", args.number):
            error(f"Error: --number must be an unsigned integer, got '{args.number}'")
            return 1
        else:
            resolved = int(args.number)
        if resolved > 9223372036854775807:
            error(f"Error: feature number must be between 0 and 9223372036854775807, got '{resolved}'")
            return 1
        number = f"{resolved:03d}"
        if has_number and specs_dir.is_dir():
            requested = fitted_branch_name(number, suffix)
            requested_dir = specs_dir / requested
            conflict = any(
                entry.is_dir() and entry.name.startswith(f"{number}-")
                for entry in specs_dir.iterdir()
            )
            if conflict and not (args.allow_existing_branch and requested_dir.is_dir()):
                resolved = highest
                while True:
                    resolved += 1
                    if resolved > 9223372036854775807:
                        error("Error: feature number exceeds 9223372036854775807")
                        return 1
                    number = f"{resolved:03d}"
                    if not any(
                        entry.is_dir() and entry.name.startswith(f"{number}-")
                        for entry in specs_dir.iterdir()
                    ):
                        break
                error(f"[specify] Warning: --number {args.number} conflicts with an existing spec directory; using {number} instead")

    branch_name = fitted_branch_name(number, suffix)
    original_name = f"{number}-{suffix}"
    if branch_name != original_name:
        error(f"[specify] Warning: Branch name exceeded GitHub's {MAX_BRANCH_LENGTH}-byte limit")
        error(f"[specify] Original: {original_name} ({len(original_name.encode('utf-8'))} bytes)")
        error(f"[specify] Truncated to: {branch_name} ({len(branch_name.encode('utf-8'))} bytes)")
    feature_dir = specs_dir / branch_name
    spec_file = feature_dir / "spec.md"

    if not args.dry_run:
        if feature_dir.is_dir() and not args.allow_existing_branch:
            error(f"Error: Feature directory '{feature_dir}' already exists. Use a different feature name or number.")
            return 1
        needs_spec = not spec_file.is_file()
        content = resolve_template_content("spec-template", root) if needs_spec else None
        feature_dir.mkdir(parents=True, exist_ok=True)
        if needs_spec:
            if content is None:
                error("Warning: Spec template not found; created empty spec file")
                spec_file.touch()
            else:
                spec_file.write_text(content, encoding="utf-8")
        if os.environ.get("SPECIFY_FEATURE_NO_PERSIST", "").lower() not in ("1", "true"):
            save_feature_json(root, str(feature_dir))
        os.environ["SPECIFY_FEATURE"] = branch_name
        os.environ["SPECIFY_FEATURE_DIRECTORY"] = str(feature_dir)
        error(f"# To persist: export SPECIFY_FEATURE={shlex.quote(branch_name)}")
        error(f"#              export SPECIFY_FEATURE_DIRECTORY={shlex.quote(str(feature_dir))}")

    result = {"BRANCH_NAME": branch_name, "SPEC_FILE": str(spec_file), "FEATURE_NUM": number}
    if args.dry_run:
        result["DRY_RUN"] = True
    if args.json:
        print(compact_json(result))
    else:
        for key, value in result.items():
            print(f"{key}: {str(value).lower() if isinstance(value, bool) else value}")
        if not args.dry_run:
            print(f"# To persist in your shell: export SPECIFY_FEATURE={shlex.quote(branch_name)}")
            print(f"#                           export SPECIFY_FEATURE_DIRECTORY={shlex.quote(str(feature_dir))}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Portable Python 3 implementations of the Spec Kit project scripts."
    )
    commands = parser.add_subparsers(dest="command", required=True)

    resolve = commands.add_parser("resolve-template", add_help=False)
    resolve.add_argument("template_name", nargs="?")
    add_json_option(resolve)
    resolve.add_argument("--help", "-Help", action="store_true")
    resolve.set_defaults(handler=cmd_resolve_template)

    check = commands.add_parser("check-prerequisites")
    add_json_option(check)
    check.add_argument("--require-spec", "-RequireSpec", action="store_true")
    check.add_argument("--require-tasks", "-RequireTasks", action="store_true")
    check.add_argument("--include-tasks", "-IncludeTasks", action="store_true")
    check.add_argument("--paths-only", "-PathsOnly", action="store_true")
    check.add_argument("--template", "-Template")
    check.set_defaults(handler=cmd_check_prerequisites)

    plan = commands.add_parser("setup-plan")
    add_json_option(plan)
    plan.set_defaults(handler=cmd_setup_plan)

    tasks = commands.add_parser("setup-tasks")
    add_json_option(tasks)
    tasks.set_defaults(handler=cmd_setup_tasks)

    feature = commands.add_parser("create-new-feature")
    add_json_option(feature)
    feature.add_argument("--dry-run", "-DryRun", action="store_true")
    feature.add_argument("--allow-existing-branch", "-AllowExistingBranch", action="store_true")
    feature.add_argument("--short-name", "-ShortName")
    feature.add_argument("--number", "-Number")
    feature.add_argument("--timestamp", "-Timestamp", action="store_true")
    feature.add_argument("description", nargs="+")
    feature.set_defaults(handler=cmd_create_new_feature)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.handler(args)
    except (OSError, ValueError) as exc:
        error(str(exc))
        return 1


if __name__ == "__main__":
    sys.exit(main())
