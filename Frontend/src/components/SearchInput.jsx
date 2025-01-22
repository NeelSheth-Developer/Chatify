import { Search, X } from "lucide-react";
import { useChatStore } from "../../public/useChatStore";

const SearchInput = () => {
  const { searchQuery, setSearchQuery, clearSearch } = useChatStore();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input input-bordered w-full pl-10 pr-10"
      />
      {searchQuery && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <X className="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
