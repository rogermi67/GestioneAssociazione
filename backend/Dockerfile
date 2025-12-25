FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY AssociazioneETS.API.csproj ./
RUN dotnet restore "AssociazioneETS.API.csproj"
COPY . .
RUN dotnet build "AssociazioneETS.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AssociazioneETS.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "AssociazioneETS.API.dll"]
